(function () {
  try {
    if (
      window.location &&
      window.location.protocol === 'http:' &&
      /(^|\.)quantumaibusiness\.com$/.test(window.location.hostname)
    ) {
      window.location.replace(
        'https://' +
          window.location.host +
          window.location.pathname +
          window.location.search +
          window.location.hash,
      )
      return
    }
  } catch (error) {
    // Never block landing pages.
  }

  var API = '/api/lead'
  var OWNER_INBOX = 'https://formsubmit.co/ajax/quantumbusinessstrategies@gmail.com'

  function attribution() {
    var params = new URLSearchParams(window.location.search)
    var data = {
      landing_path: window.location.pathname,
      referrer: document.referrer || '',
      first_seen: new Date().toISOString(),
    }
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'].forEach(function (key) {
      var value = params.get(key)
      if (value) data[key] = value.slice(0, 160)
    })
    return data
  }

  function withStripeTracking(href, data) {
    try {
      var url = new URL(href)
      if (url.hostname !== 'buy.stripe.com') return href
      ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'].forEach(function (key) {
        if (data[key] && !url.searchParams.get(key)) url.searchParams.set(key, data[key])
      })
      if (!url.searchParams.get('client_reference_id')) {
        url.searchParams.set('client_reference_id', 'qab_' + Date.now())
      }
      return url.toString()
    } catch (error) {
      return href
    }
  }

  function postAutomationEvent(eventType, payload) {
    try {
      var body = JSON.stringify({
        event_type: eventType,
        action_mode: 'auto_route',
        source: 'quantumaibusiness.com',
        payload: Object.assign(
          {
            page: window.location.pathname,
            title: document.title,
            url: window.location.href,
          },
          payload || {},
        ),
      })
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'text/plain' })
        navigator.sendBeacon(API, blob)
        return
      }
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'application/json' },
        body: body,
        keepalive: true,
      })
    } catch (error) {
      // Traffic tracking must never block the landing page.
    }
  }

  async function postOwnerFallback(eventType, payload) {
    try {
      var response = await fetch(OWNER_INBOX, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'QuantumAiBusiness checkout intake',
          _template: 'table',
          _captcha: 'false',
          event_type: eventType,
          source: 'quantumaibusiness.com',
          ...payload,
        }),
        keepalive: true,
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  function pulseOnce() {
    try {
      var data = attribution()
      var key = 'qab_static_pulse_' + window.location.pathname + '_' + (data.utm_source || '') + '_' + (data.utm_campaign || '')
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, '1')
      postAutomationEvent('static_landing_view', { attribution: data })
    } catch (error) {
      postAutomationEvent('static_landing_view', { attribution: attribution() })
    }
  }

  pulseOnce()

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a')
    if (!link) return
    var href = link.href || ''
    var label = (link.textContent || '').trim().slice(0, 100)
    var highIntent = href.indexOf('buy.stripe.com') !== -1 || /scan|checkout|start|growth|utility/i.test(label)
    if (!highIntent) return
    if (href.indexOf('buy.stripe.com') !== -1) {
      var trackedHref = withStripeTracking(href, attribution())
      window.gtag?.('event', 'package_checkout_started', {
        event_category: 'commerce',
        event_label: label || 'backup_stripe_checkout',
        checkout_type: 'backup_stripe_link',
        destination: trackedHref,
      })
      window.fbq?.('track', 'InitiateCheckout', { content_name: label || 'Backup Stripe Checkout', currency: 'USD' })
      if (trackedHref !== href) {
        event.preventDefault()
        window.location.assign(trackedHref)
      }
    }
    postAutomationEvent('static_landing_click', {
      label: label,
      destination: href,
      attribution: attribution(),
    })
  })

  document.addEventListener('submit', async function (event) {
    var form = event.target.closest && event.target.closest('.checkout-form')
    if (!form) return

    event.preventDefault()
    var status = form.querySelector('.checkout-status')
    var button = form.querySelector('button[type="submit"]')
    var fallback = form.getAttribute('data-fallback-url')
    var packageName = form.getAttribute('data-package-name')
    var payload = {
      package_key: form.getAttribute('data-package-key'),
      package_name: packageName,
      company: form.elements.company.value,
      website: form.elements.website.value,
      customer_email: form.elements.customer_email.value,
      objective: form.elements.objective.value,
      current_tools: 'Static landing page checkout intake',
      constraints: 'Submitted from ' + window.location.pathname,
      attribution: attribution(),
      source: 'static_landing_one_step_checkout',
    }

    try {
      status.textContent = 'Creating tracked checkout...'
      button.disabled = true
      window.gtag?.('event', 'static_one_step_checkout_started', {
        event_category: 'commerce',
        event_label: packageName,
      })
      window.fbq?.('track', 'InitiateCheckout', { content_name: packageName, currency: 'USD' })

      var response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      var data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Checkout failed')
      status.textContent = 'Opening Stripe checkout...'
      window.location.assign(data.url)
    } catch (error) {
      status.textContent = 'Saving intake and opening Stripe checkout...'
      await postOwnerFallback('checkout_intake_before_backup_stripe', payload)
      if (fallback) {
        var trackedFallback = withStripeTracking(fallback, payload.attribution || attribution())
        window.gtag?.('event', 'backup_stripe_checkout_opened', {
          event_category: 'commerce',
          event_label: packageName,
        })
        window.location.assign(trackedFallback)
      }
    } finally {
      button.disabled = false
    }
  })
})()

(function () {
  var API = 'https://quantumaibusiness.vercel.app/api/lead'

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
        var blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon(API, blob)
        return
      }
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body,
        keepalive: true,
      })
    } catch (error) {
      // Traffic tracking must never block the landing page.
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

      var response = await fetch('https://quantumaibusiness.vercel.app/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      var data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Checkout failed')
      status.textContent = 'Opening Stripe checkout...'
      window.location.assign(data.url)
    } catch (error) {
      status.textContent = 'Tracked checkout failed. Opening backup Stripe link...'
      if (fallback) window.location.assign(fallback)
    } finally {
      button.disabled = false
    }
  })
})()

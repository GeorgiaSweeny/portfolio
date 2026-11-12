// georgiasweeny.com: the only script. Everything works without it; this adds
// the phone filter menu, click-to-load videos, the lightbox and an inline contact form.
(() => {
  // ---- discipline filter (phones): jump to the discipline's own page
  document.querySelectorAll("select[data-filter]").forEach((sel) => {
    sel.addEventListener("change", () => { location.href = sel.value; });
  });

  // ---- videos: a still with a play button, swapped for YouTube only on click
  document.querySelectorAll(".video[data-youtube]").forEach((box) => {
    box.querySelector("button").addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.youtube)}?autoplay=1&rel=0`;
      f.title = box.dataset.title || "Video";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      box.replaceChildren(f);
      f.focus();
    }, { once: true });
  });

  // ---- lightbox: arrows and arrow keys move within one gallery, Esc closes
  const links = [...document.querySelectorAll("a[data-lightbox]")];
  if (links.length && "HTMLDialogElement" in window) {
    const dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Enlarged image");
    dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="close" type="button" aria-label="Close">×</button>' +
      '<button class="prev" type="button" aria-label="Previous image">←</button>' +
      '<button class="next" type="button" aria-label="Next image">→</button>';
    document.body.append(dlg);
    const img = dlg.querySelector("img"), cap = dlg.querySelector("figcaption");
    let set = [], i = 0;
    const show = (n) => {
      i = (n + set.length) % set.length;
      const a = set[i], thumb = a.querySelector("img");
      img.src = a.href;
      img.alt = thumb ? thumb.alt : "";
      cap.textContent = a.closest("figure")?.querySelector("figcaption")?.textContent || "";
      dlg.querySelectorAll(".prev,.next").forEach((b) => { b.hidden = set.length < 2; });
    };
    links.forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const group = a.closest(".gallery, .tiles");
      set = links.filter((l) => l.closest(".gallery, .tiles") === group);
      show(set.indexOf(a));
      dlg.showModal();
    }));
    dlg.querySelector(".close").onclick = () => dlg.close();
    dlg.querySelector(".prev").onclick = () => show(i - 1);
    dlg.querySelector(".next").onclick = () => show(i + 1);
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.tagName === "FIGURE") dlg.close(); });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  }

  // ---- contact form: Cloudflare Turnstile spam check, rendered explicitly so
  // the form can wait for its token before sending.
  const form = document.querySelector(".contact-form");
  if (form) {
    const msg = form.querySelector(".form-msg");
    const btn = form.querySelector(".sendbtn");
    const box = form.querySelector(".cf-turnstile");
    let widgetId = null, loading = false;
    const render = () => {
      if (widgetId !== null || !window.turnstile) return;
      widgetId = window.turnstile.render(box, {
        sitekey: box.dataset.sitekey,
        theme: "dark",
        appearance: "interaction-only",
        "error-callback": (code) => {
          msg.className = "form-msg err";
          msg.textContent = `The spam check couldn’t load (code ${code}). Please refresh and try again.`;
          return true;
        },
      });
    };
    window.onTurnstileLoad = render;
    const load = () => {
      if (loading) return;
      loading = true;
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
      s.async = true;
      document.head.append(s);
    };
    // Load when the form comes near the screen, or as soon as someone touches it.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { load(); io.disconnect(); } }, { rootMargin: "600px" });
      io.observe(form);
    }
    form.addEventListener("focusin", load);

    const token = async () => {
      for (let i = 0; i < 30; i++) {           // wait up to 15 s for the check to finish
        const t = widgetId !== null && window.turnstile ? window.turnstile.getResponse(widgetId) : "";
        if (t) return t;
        await new Promise((r) => setTimeout(r, 500));
      }
      return "";
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      load();
      msg.className = "form-msg";
      msg.textContent = "Sending…";
      btn.disabled = true;
      try {
        const t = await token();
        if (!t) throw new Error("The spam check is still loading. Please wait a moment and try again.");
        const body = new FormData(form);
        body.set("cf-turnstile-response", t);
        const res = await fetch(form.action, { method: "POST", body, headers: { Accept: "application/json" } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
        form.reset();
        msg.textContent = "Thank you! Your message is on its way, and I’ll reply soon.";
      } catch (err) {
        msg.className = "form-msg err";
        msg.textContent = `${err.message} You can also reach me on LinkedIn.`;
      } finally {
        if (widgetId !== null) window.turnstile.reset(widgetId); // a token works only once
        btn.disabled = false;
      }
    });
  }
})();

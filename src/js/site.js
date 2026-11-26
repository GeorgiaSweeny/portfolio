// georgiasweeny.com: the only script. Everything works without it; this adds
// the phone filter menu, click-to-load videos, the lightbox and an inline contact form.
(() => {
  // ---- discipline filter (phones): jump to the discipline's own page
  document.querySelectorAll("select[data-filter]").forEach((sel) => {
    sel.addEventListener("change", () => { location.href = sel.value; });
  });

  // ---- top bar: every link on one line. If it doesn't fit, one step at a time: narrower gaps on wider
  // screens (tg), Get in touch goes from the pill to the envelope (t1), Personal Work becomes
  // an icon (t2), tighter gaps (t4), CV becomes an icon (t3), and a smaller name on the narrowest phones (t5).
  document.querySelectorAll(".topbar").forEach((bar) => {
    // Home keeps the Get in touch pill on phones as long as possible, so there the pill goes last.
    const steps = bar.classList.contains("on-home") ? ["tg", "t2", "t4", "t3", "t1", "t5"] : ["tg", "t1", "t2", "t4", "t3", "t5"];
    // Overflow on either side: Home's links sit to the right, so they spill off the left edge.
    const over = () => {
      if (bar.scrollWidth > bar.clientWidth + 1) return true;
      const b = bar.getBoundingClientRect();
      return [...bar.querySelectorAll("a, button")].some((el) => {
        if (!el.offsetParent) return false;
        const r = el.getBoundingClientRect();
        return r.left < b.left - 1 || r.right > b.right + 1;
      });
    };
    const fit = () => {
      bar.classList.remove(...steps);
      for (const s of steps) { if (!over()) break; bar.classList.add(s); }
    };
    fit();
    addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
  });

  // ---- galleries (phones): images sharing a row are the same height. CSS puts portrait and square
  // images two to a row at half width each; here each pair splits the row by shape (aspect ratio),
  // so both come out equally tall. A reference beside its work (.pair) keeps its own sizing.
  const phone = matchMedia("(max-width: 699px)");
  const evenRows = () => {
    document.querySelectorAll(".gallery:not(.cols)").forEach((g) => {
      const figs = [...g.children].filter((f) => f.tagName === "FIGURE");
      figs.forEach((f) => { f.style.width = ""; });
      if (!phone.matches) return;
      const full = g.clientWidth;
      const gap = parseFloat(getComputedStyle(g).columnGap) || 0;
      let run = [];
      const flush = () => {
        for (let i = 0; i + 1 < run.length; i += 2) {
          const a = run[i], b = run[i + 1];
          const ra = parseFloat(a.style.getPropertyValue("--ar")) || 1, rb = parseFloat(b.style.getPropertyValue("--ar")) || 1;
          a.style.width = `calc((100% - ${gap}px) * ${ra / (ra + rb)})`;
          b.style.width = `calc((100% - ${gap}px) * ${rb / (ra + rb)})`;
        }
        run = [];
      };
      [...g.children].forEach((el) => {
        if (el.tagName === "FIGURE" && el.getBoundingClientRect().width < full * 0.7) run.push(el);
        else flush(); // a full-width image or a reference pair starts a new row
      });
      flush();
    });
  };
  evenRows();
  phone.addEventListener("change", evenRows);
  addEventListener("resize", evenRows);

  // ---- project pages (phones): the "Jump to" drop-down, and Read more for the intro and facts
  // Wider screens: the row of links, unless it would need more than one line.
  document.querySelectorAll(".proj-jump").forEach((nav) => {
    const chips = nav.querySelector(".chips");
    const fit = () => {
      nav.classList.remove("as-select");
      const links = chips.querySelectorAll("a");
      if (!links.length || !chips.offsetParent) return; // hidden (phones): the drop-down shows anyway
      nav.classList.toggle("as-select", links[links.length - 1].offsetTop > links[0].offsetTop + 4);
    };
    fit();
    addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
  });
  document.querySelectorAll("select[data-jump]").forEach((sel) => {
    sel.addEventListener("change", () => {
      const v = sel.value;
      sel.value = "";
      if (!v) return;
      if (location.hash === v) document.querySelector(v)?.scrollIntoView(); // same section again
      else location.hash = v; // the browser's own anchor jump (honours scroll-margin-top)
    });
  });
  document.querySelectorAll("[data-read-more]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".proj-open")?.classList.add("expanded");
      btn.setAttribute("aria-expanded", "true");
    });
  });

  // ---- silent looping clips: stay on their still image if the visitor prefers less motion
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video[data-autoplay]").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
  }

  // ---- feature cards: silent clips play only while on screen; the words come in once
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window) {
    const vids = document.querySelectorAll("video[data-inview]");
    const vio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !still) e.target.play().catch(() => {}); else e.target.pause();
    }), { threshold: 0.25 });
    vids.forEach((v) => vio.observe(v));
    const fio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); fio.unobserve(e.target); }
    }), { threshold: 0.3 });
    document.querySelectorAll(".feature").forEach((f) => fio.observe(f));
  } else {
    document.querySelectorAll(".feature").forEach((f) => f.classList.add("in"));
  }

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
    dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption><p class="count" hidden></p></figure>' +
      '<button class="close" type="button" aria-label="Close">×</button>' +
      '<button class="prev" type="button" aria-label="Previous image">←</button>' +
      '<button class="next" type="button" aria-label="Next image">→</button>';
    document.body.append(dlg);
    const img = dlg.querySelector("img"), cap = dlg.querySelector("figcaption"), count = dlg.querySelector(".count");
    let set = [], i = 0;
    const show = (n) => {
      i = (n + set.length) % set.length;
      const a = set[i], thumb = a.querySelector("img");
      img.src = a.href;
      img.alt = thumb ? thumb.alt : (a.dataset.alt || "");
      // data-caption (Personal Work: title, medium and year, note; stage captions) beats the visible label
      cap.textContent = a.dataset.caption ?? (a.closest("figure")?.querySelector("figcaption")?.textContent || "");
      // Personal Work: "2 of 4" within one artwork (its own images: the piece, then its stages)
      const own = a.dataset.group ? set.filter((l) => l.dataset.group === a.dataset.group) : [];
      count.hidden = own.length < 2;
      count.textContent = own.length > 1 ? `${own.indexOf(a) + 1} of ${own.length}` : "";
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

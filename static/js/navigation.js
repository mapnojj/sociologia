(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const slides = [...document.querySelectorAll(".slide")];
        const navDots = document.getElementById("nav-dots");
        const globalControls = document.getElementById("global-controls");

        if (!slides.length || !navDots) return;

        slides.forEach((slide, index) => {
            slide.dataset.navIndex = String(index);
        });

        let currentIndex = 0;
        let lock = false;

        navDots.innerHTML = slides
            .map((_, index) => `<button class="nav-dot ${index === 0 ? "active" : ""}" data-index="${index}" aria-label="Ir para seção ${index + 1}"></button>`)
            .join("");

        const dots = [...navDots.querySelectorAll(".nav-dot")];
        const scrollHint = document.getElementById("scroll-hint");

        function setActive(index) {
            const previousSlide = slides[currentIndex];
            currentIndex = index;
            const activeSlide = slides[index];

            if (previousSlide && previousSlide !== activeSlide && previousSlide.dataset.temporaryTabindex === "true") {
                previousSlide.removeAttribute("tabindex");
                delete previousSlide.dataset.temporaryTabindex;
            }

            dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
            document.body.classList.toggle("hero-active", index === 0);

            if (globalControls) {
                const shouldHideGlobalControls = activeSlide?.dataset.hideGlobalControls === "true";

                if (shouldHideGlobalControls && globalControls.contains(document.activeElement) && activeSlide) {
                    const needsTemporaryTabIndex = !activeSlide.hasAttribute("tabindex");

                    if (needsTemporaryTabIndex) {
                        activeSlide.setAttribute("tabindex", "-1");
                        activeSlide.dataset.temporaryTabindex = "true";
                    }

                    activeSlide.focus({ preventScroll: true });
                }

                globalControls.classList.toggle("controls-hidden", shouldHideGlobalControls);

                if ("inert" in globalControls) {
                    globalControls.inert = shouldHideGlobalControls;
                }

                globalControls.setAttribute("aria-hidden", shouldHideGlobalControls ? "true" : "false");
            }
        }

        function scrollToSlide(index) {
            if (lock || index < 0 || index >= slides.length) return;
            lock = true;
            slides[index].scrollIntoView({ behavior: "smooth", block: "start" });
            setTimeout(() => {
                lock = false;
            }, 700);
        }

        function isFormFocused() {
            const active = document.activeElement;
            if (!active) return false;
            const tag = active.tagName;
            return ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag) || active.isContentEditable;
        }

        function onKeydown(event) {
            if (isFormFocused()) return;

            if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
                event.preventDefault();
                scrollToSlide(currentIndex + 1);
            }

            if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
                event.preventDefault();
                scrollToSlide(currentIndex - 1);
            }
        }

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const targetIndex = Number(dot.dataset.index);
                scrollToSlide(targetIndex);
            });
        });

        if (scrollHint) {
            scrollHint.addEventListener("click", () => {
                const currentSlide = scrollHint.closest(".slide");
                const currentSlideIndex = currentSlide ? slides.indexOf(currentSlide) : -1;
                const nextSlideIndex = currentSlideIndex + 1;
                if (nextSlideIndex > 0 && nextSlideIndex < slides.length) {
                    scrollToSlide(nextSlideIndex);
                }
            });
        }

        const initialIndex = slides.reduce(
            (bestIndex, slide, index) => {
                const { top, bottom } = slide.getBoundingClientRect();
                const distance = Math.abs(top);
                const intersectsViewport = top < window.innerHeight * 0.65 && bottom > window.innerHeight * 0.35;
                if (intersectsViewport) {
                    return { index, distance: -1 };
                }
                return distance < bestIndex.distance ? { index, distance } : bestIndex;
            },
            { index: 0, distance: Number.POSITIVE_INFINITY }
        ).index;

        setActive(initialIndex);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
                        const rawNavIndex = entry.target.dataset.navIndex;
                        const navIndex = rawNavIndex !== undefined && rawNavIndex !== "" ? Number(rawNavIndex) : Number.NaN;
                        const index = Number.isInteger(navIndex) ? navIndex : slides.indexOf(entry.target);
                        if (Number.isInteger(index) && index >= 0) {
                            setActive(index);
                        }
                    }
                });
            },
            { threshold: [0.55, 0.7] }
        );

        slides.forEach((slide) => observer.observe(slide));
        document.addEventListener("keydown", onKeydown);
    });
})();

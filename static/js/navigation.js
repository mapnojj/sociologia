(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const slides = [...document.querySelectorAll(".slide")];
        const navDots = document.getElementById("nav-dots");

        if (!slides.length || !navDots) return;

        let currentIndex = 0;
        let lock = false;

        navDots.innerHTML = slides
            .map((_, index) => `<button class="nav-dot ${index === 0 ? "active" : ""}" data-index="${index}" aria-label="Ir para seção ${index + 1}"></button>`)
            .join("");

        const dots = [...navDots.querySelectorAll(".nav-dot")];
        const scrollHint = document.getElementById("scroll-hint");

        function setActive(index) {
            currentIndex = index;
            dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
            document.body.classList.toggle("hero-active", index === 0);
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
                        const index = slides.indexOf(entry.target);
                        if (index >= 0) {
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

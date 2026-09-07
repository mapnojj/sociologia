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

        function setActive(index) {
            currentIndex = index;
            dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
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

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
                        const index = Number(entry.target.dataset.slideIndex || 0);
                        setActive(index);
                    }
                });
            },
            { threshold: [0.55, 0.7] }
        );

        slides.forEach((slide) => observer.observe(slide));
        document.addEventListener("keydown", onKeydown);
    });
})();

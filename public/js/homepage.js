// Homepage enhancements and navigation
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special handling for counter animations
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in, .stat-number').forEach(el => {
        observer.observe(el);
    });

    // Counter animation function
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Scroll progress indicator
    function updateScrollProgress() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;
        
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.width = scrollProgress + '%';
    }

    // Add scroll event listener
    window.addEventListener('scroll', updateScrollProgress);

    // Add parallax effect to background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const background = document.querySelector('.animated-bg');
        if (background) {
            background.style.transform = `translateY(${rate}px)`;
        }
        
        // Update navbar background
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrolled > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    });

    // Add ripple effect to buttons
    document.querySelectorAll('.btn-primary-custom, .btn-secondary-custom').forEach(button => {
        button.classList.add('btn-ripple');
        
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add typing animation to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        heroTitle.style.borderRight = '3px solid white';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    // Skip HTML tags
                    const tagEnd = text.indexOf('>', i);
                    heroTitle.innerHTML += text.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                } else {
                    heroTitle.innerHTML += text.charAt(i);
                    i++;
                }
                setTimeout(typeWriter, 50);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 500);
            }
        };
        
        // Start typing animation after page loads
        setTimeout(typeWriter, 1000);
    }

    // Add floating icons
    function createFloatingIcons() {
        const icons = ['bi-mortarboard', 'bi-book', 'bi-calendar-check', 'bi-graph-up'];
        const container = document.querySelector('.hero-section');
        
        if (container) {
            icons.forEach((icon, index) => {
                const iconElement = document.createElement('i');
                iconElement.className = `bi ${icon} floating-icon`;
                iconElement.style.animationDelay = `${index * 2}s`;
                container.appendChild(iconElement);
            });
        }
    }
    
    // Create floating icons
    createFloatingIcons();

    // Add glow effect to title on mouse move
    document.addEventListener('mousemove', function(e) {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const rect = heroTitle.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                heroTitle.classList.add('glow-text');
            } else {
                heroTitle.classList.remove('glow-text');
            }
        }
    });

    // Redirect functions for login and signup buttons
    window.redirectToLogin = function() {
        window.location.href = '/login';
    };

    window.redirectToSignup = function() {
        window.location.href = '/login#signup';
    };

    // Handle login/signup button clicks
    document.querySelectorAll('a[href="/login"], a[href="#login"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.redirectToLogin();
        });
    });

    document.querySelectorAll('a[href="/signup"], a[href="#signup"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.redirectToSignup();
        });
    });
});

// Additional CSS for ripple effect
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

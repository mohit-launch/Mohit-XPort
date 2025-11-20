        const revealElements = document.querySelectorAll('.reveal-up');

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% visible
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));


        /* --- NAVBAR MOBILE TOGGLE --- */
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');

        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-links li a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            });
        });

        /* --- THREE.JS BACKGROUND --- */
        const canvas = document.getElementById('bg-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Particles
        const geometry = new THREE.BufferGeometry();
        const particlesCount = 130;
        const posArray = new Float32Array(particlesCount * 3);

        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 25;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Initial Material (Dark Mode Color)
        let particleColor = 0x38bdf8; // Cyan
        const material = new THREE.PointsMaterial({
            size: 0.07,
            color: particleColor,
            transparent: true,
            opacity: 0.8
        });

        const particlesMesh = new THREE.Points(geometry, material);
        scene.add(particlesMesh);
        camera.position.z = 5;

        // Mouse Interaction
        let mouseX = 0;
        let mouseY = 0;
        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        });

        // Animation
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = mouseY * 0.5;
            particlesMesh.rotation.y += mouseX * 0.5;
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        /* --- THEME TOGGLE & SUNRAY EFFECT --- */
        const toggleBtn = document.getElementById('theme-toggle');
        const icon = toggleBtn.querySelector('i');

        // Function to update 3D particles based on theme
        function updateParticles(isLight) {
            const newColor = isLight ? 0x0284c7 : 0x38bdf8; // Deep Blue vs Cyan
            material.color.setHex(newColor);
            icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
        }

        toggleBtn.addEventListener('click', (event) => {
            const isLight = document.body.classList.contains('light-mode');
            
            // Fallback for browsers that don't support View Transitions
            if (!document.startViewTransition) {
                document.body.classList.toggle('light-mode');
                updateParticles(!isLight);
                return;
            }

            // Calculate distance to farthest corner for the circle effect
            const x = event.clientX;
            const y = event.clientY;
            const endRadius = Math.hypot(
                Math.max(x, innerWidth - x),
                Math.max(y, innerHeight - y)
            );

            // Start the View Transition
            const transition = document.startViewTransition(() => {
                document.body.classList.toggle('light-mode');
                updateParticles(!isLight);
            });

            // Animate the clip-path
            transition.ready.then(() => {
                const clipPath = [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ];
                
                // If turning ON light mode, expanding circle is New state.
                // If turning OFF light mode, expanding circle is Old state (reversed).
                const isGoingLight = document.body.classList.contains('light-mode');
                
                document.documentElement.animate(
                    {
                        clipPath: isGoingLight ? clipPath : [...clipPath].reverse(),
                    },
                    {
                        duration: 500,
                        easing: 'ease-in',
                        pseudoElement: isGoingLight 
                            ? '::view-transition-new(root)' 
                            : '::view-transition-old(root)',
                    }
                );
            });
        });
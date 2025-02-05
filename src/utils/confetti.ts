import confetti from 'canvas-confetti';

export const launchConfetti = () => {
  console.log('Launching greyscale confetti celebration');
  
  // Determine if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Set colors based on theme
  const colors = isDarkMode
    ? ['#ffffff', '#e5e5e5', '#d4d4d4', '#a3a3a3'] // Light greys for dark mode
    : ['#000000', '#262626', '#404040', '#525252']; // Dark greys for light mode
  
  // Launch from right corner
  confetti({
    particleCount: 300,
    spread: 90,
    origin: { x: 1, y: 0.9 },
    colors: colors,
    startVelocity: 45,
    gravity: 1.2,
    shapes: ['circle', 'square'],
    ticks: 400
  });

  // Launch from left corner
  confetti({
    particleCount: 300,
    spread: 90,
    origin: { x: 0, y: 0.9 },
    colors: colors,
    startVelocity: 45,
    gravity: 1.2,
    shapes: ['circle', 'square'],
    ticks: 400
  });
};
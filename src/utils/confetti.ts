import confetti from 'canvas-confetti';

export const launchConfetti = () => {
  console.log('Launching confetti celebration with updated styling');
  
  // Launch from right corner
  confetti({
    particleCount: 300,
    spread: 90,
    origin: { x: 1, y: 0.9 },
    colors: ['#c3caf5', '#d6f37d', '#3fcf8e', '#ffb224'],
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
    colors: ['#c3caf5', '#d6f37d', '#3fcf8e', '#ffb224'],
    startVelocity: 45,
    gravity: 1.2,
    shapes: ['circle', 'square'],
    ticks: 400
  });
};
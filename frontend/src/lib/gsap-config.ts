import gsap from 'gsap';

/**
 * GSAP Configuration and Animation Presets
 * Shonen Jump aesthetic: Bouncy, energetic, high-contrast
 */

// Set global GSAP defaults
gsap.defaults({
  ease: 'power2.out',
  duration: 0.6,
});

/**
 * Story transitions
 */
export const storyAnimations = {
  /**
   * Slide in story from right
   */
  slideIn: (element: HTMLElement, onComplete?: () => void) => {
    return gsap.fromTo(
      element,
      {
        x: '100%',
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        onComplete,
      }
    );
  },

  /**
   * Slide out story to left
   */
  slideOut: (element: HTMLElement, onComplete?: () => void) => {
    return gsap.to(element, {
      x: '-100%',
      opacity: 0,
      duration: 0.5,
      ease: 'power3.in',
      onComplete,
    });
  },

  /**
   * Progress bar animation
   */
  progressBar: (element: HTMLElement, duration: number) => {
    gsap.set(element, { scaleX: 0, transformOrigin: 'left' });
    return gsap.to(element, {
      scaleX: 1,
      duration,
      ease: 'none',
    });
  },
};

/**
 * Card animations
 */
export const cardAnimations = {
  /**
   * Bouncy entrance
   */
  bounceIn: (element: HTMLElement, delay: number = 0) => {
    return gsap.fromTo(
      element,
      {
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        delay,
        ease: 'back.out(1.7)',
      }
    );
  },

  /**
   * Hover scale effect
   */
  hoverScale: (element: HTMLElement) => {
    return gsap.to(element, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    });
  },

  /**
   * Reset scale
   */
  resetScale: (element: HTMLElement) => {
    return gsap.to(element, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  },
};

/**
 * Text animations
 */
export const textAnimations = {
  /**
   * Typing effect
   */
  typeWriter: (element: HTMLElement, text: string, onComplete?: () => void) => {
    const chars = text.split('');
    element.textContent = '';
    
    chars.forEach((char, i) => {
      gsap.to({}, {
        duration: 0.05,
        delay: i * 0.05,
        onComplete: () => {
          element.textContent += char;
          if (i === chars.length - 1 && onComplete) {
            onComplete();
          }
        },
      });
    });
  },

  /**
   * Fade in words
   */
  fadeInWords: (element: HTMLElement) => {
    const words = element.textContent?.split(' ') || [];
    element.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
    
    return gsap.from(element.querySelectorAll('.word'), {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out',
    });
  },
};

/**
 * Page transitions
 */
export const pageAnimations = {
  /**
   * Fade in page
   */
  fadeIn: (element: HTMLElement, onComplete?: () => void) => {
    return gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete,
      }
    );
  },

  /**
   * Energetic entrance
   */
  energeticEntrance: (elements: HTMLElement[]) => {
    return gsap.from(elements, {
      scale: 0.8,
      opacity: 0,
      y: 50,
      stagger: 0.1,
      duration: 0.6,
      ease: 'back.out(1.4)',
    });
  },
};

export default gsap;

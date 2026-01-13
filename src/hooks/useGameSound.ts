import useSound from 'use-sound';

// Placeholder sounds (Silent or Generic Beeps)
// In a real app, these would be local assets or CDN links.
// For this demo, we can use simple base64 beeps or just log if no assets.
// I will use some common online placeholder sounds if available, otherwise just logs.
// Using simple online beep for testing if possible. 
const SOUNDS = {
    hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Sci-fi click
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Heavy Click
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Success Chime
    failure: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Error Buzz
    glitch: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3', // Static
};

export function useGameSound() {
    const [playHover] = useSound(SOUNDS.hover, { volume: 0.2 });
    const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });
    const [playSuccess] = useSound(SOUNDS.success, { volume: 0.5 });
    const [playFailure] = useSound(SOUNDS.failure, { volume: 0.5 });
    const [playGlitch] = useSound(SOUNDS.glitch, { volume: 0.3 });

    return {
        playHover,
        playClick,
        playSuccess,
        playFailure,
        playGlitch
    };
}

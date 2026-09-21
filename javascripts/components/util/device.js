// Touch-first devices (phones, tablets) get the mobile layout.
// Add ?device=mobile or ?device=desktop to the URL to force one for testing.
export const isMobileDevice = () => {
    const override = new URLSearchParams(window.location.search).get('device');
    if (override === 'mobile') return true;
    if (override === 'desktop') return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
};

export const getViewportSize = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};

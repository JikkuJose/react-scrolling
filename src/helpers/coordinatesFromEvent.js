export const eventCoordinates = (e, scale) => {
    const shift = window.innerWidth / 2 * (1 - scale);

    if (e.touches && e.touches.length > 0) {
        return {
            x: (e.touches[0].clientX - shift) / scale,
            y: e.touches[0].clientY / scale,
        };
    }

    return {
        x: (e.clientX - shift) / scale,
        y: e.clientY / scale,
    };
};

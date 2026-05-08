export function InitializeJoystick() {
    window.addEventListener("gamepadconnected", (e) => {
        const gp = navigator.getGamepads()[e.gamepad.index];
        console.log(
            `Gamepad connected at index ${gp.index}: ${gp.id} with ${gp.buttons.length} buttons, ${gp.axes.length} axes.`,
        );
    });
}

export function UpdateJoystick() {
    
    gamepads = navigator.getGamepads();
    navigator.
    pad = gamepads[0];
    if (!pad) return;

    // Botón A (Xbox)
    if (pad.buttons[0].pressed) {
        console.log('Salto');
    }

    // Stick izquierdo X
    const moveX = pad.axes[0];

    console.log(moveX);
}
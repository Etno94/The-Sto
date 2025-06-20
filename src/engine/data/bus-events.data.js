/**
 * @type { BusEvents }
 */
export const BUS_EVENTS = {
    generator: {
        onClick: 'generator: onclick',
        onCD: 'generator: on Cooldown',
        updateCD: 'generator: update Cooldown',
        ready: 'generator: ready to use',
        onUse: 'generator: used'
    },
    points: {
        add: 'point: added',
        substract: 'point: substracted',
        balance: 'point: balanced',
        burnAll: 'point: burn all',
        overcap: 'point: overcap'
    },
    storageUpgrade: {
        unlocked: 'storage upgrade: unlocked',
        onClick: 'storage upgrade: onclick',
        upgrade: 'storage upgrade: upgrade',
        onUpgrade: 'storage upgrade: onupgrade'
    },
    ui: {
        render: 'UI: rendering',
        pointsContainer: {
            hover: 'UI - Points Container: hover'
        }
    }
}
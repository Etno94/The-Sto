/**
 * @type { BusEvents }
 */
export const BUS_EVENTS = {
    generator: {
        onClick: 'generator: onclick',
        onCD: 'generator: on Cooldown',
        updateCD: 'generator: update Cooldown',
        ready: 'generator: ready to use',
        onUse: 'generator: used',
        elements: {
            statusItems: {
                pointChance: {
                    created: 'generator: point chance created',
                    onUpdate: 'generator: point chance to update',
                    updated: 'generator: point chance updated'
                }
            },
            cdCharges: 'generator: cooldown charges updated',
            pulseCells: 'generator: pulse cells  updated'
        },
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
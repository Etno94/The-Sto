/**
 * @type { BusEvents }
 */
export const BUS_EVENTS = {
    generator: {
        build: 'generator: build',
        built: 'generator: built',
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
            cdCharges: {
                build: 'generator: cd charge build',
                built: 'generator: cd charge built'
            },
            pulseCells: {
                build: 'generator: pulse cell build',
                built: 'generator: pulse cell built',
                load: 'generator: pulse cell load'
            }
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
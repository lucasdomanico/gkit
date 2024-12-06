export type mapget = <K, V,>(m:Map<K, V>, k:K, init:() => V) => V
export const mapget:mapget = <K, V,>(m:Map<K, V>, k:K, init:() => V) => {
    if(!m.has(k)) m.set(k, init())
    let v = m.get(k)
    if(v === undefined) {
        return init()
    }
    return v
}

export type main = () => void
export const main:main = () => {
    return console.log('mapget.z')
}

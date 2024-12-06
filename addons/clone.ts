/**
 * Deep clones the given object preserving its prototype.\
 * This is an alternative to `structuredClone`, which
 * omits the prototypes.
 * ```ts
 * class A {}
 * let a = new A()
 * let b = clone(a)
 * console.log(b instanceof A) // true
 * ```
 * @param object
 * @returns a deep copy/clone of the given object
 */

export const clone = <T,>(object:T):T => {
    let o = object
    let do_Array = (a:any, b:any) => {
        for(let i = 0; i < a.length; i++) {
            set_prototype(a[i], b[i])
        }
    }
    let do_Map = (a:any, b:any) => {
        let a_entries:any = Array.from(a.entries())
        let b_entries:any = Array.from(b.entries())
        a.clear()
        return a_entries.forEach((a:any, i:number) => {
            let key = a[0]
            let val = a[1]
            set_prototype(key, b_entries[i][0])
            set_prototype(val, b_entries[i][1])
            return a.set(key, val)
        })
    }
    let do_Set = (a:any, b:any) => {
        throw(new Error('Set clone not implemented'))
        return
    }
    let set_prototype = (a:any, b:any) => {
        if(b === undefined) return
        if(b === null) return
        if(b instanceof Array) return do_Array(a, b)
        if(b instanceof ArrayBuffer) return
        if(typeof(b) === 'boolean') return
        if(b instanceof DataView) return
        if(b instanceof Date) return
        if(b instanceof Error) return
        if(b instanceof Map) return do_Map(a, b)
        if(typeof(b) === 'number') return
        if(b instanceof RegExp) return
        if(b instanceof Set) return do_Set(a, b)
        if(typeof(b) === 'string') return
        if(b instanceof Int8Array) return
        if(b instanceof Uint8Array) return
        if(b instanceof Uint8ClampedArray) return
        if(b instanceof Int16Array) return
        if(b instanceof Uint16Array) return
        if(b instanceof Int32Array) return
        if(b instanceof Uint32Array) return
        if(b instanceof Float32Array) return
        if(b instanceof Float64Array) return
        if(b instanceof BigInt64Array) return
        if(b instanceof BigUint64Array) return
        Object.setPrototypeOf(a, Object.getPrototypeOf(b))
        return Object.keys(b).forEach((key) => {
            return set_prototype(a[key], b[key])
        })
    }
    let c = structuredClone(o)
    set_prototype(c, o)
    return c
}

export interface localStorage<T> {
    length(): number;
    key<U extends keyof T>(index: number): U;
    setItem<U extends keyof T>(key: U, value: T[U]): void;
    getItem<U extends keyof T>(key: U): T[U] | null;
    removeItem<U extends keyof T>(key: U): void;
    clear(): void;
    hasItem<U extends keyof T>(key: U): boolean;
    getBackup(): object | null;
    getRemainingSpace(): number;
    applyBackup(backup: object, fClear: boolean, fOverwriteExisting: boolean): void;
    getMaximumSize(): number;
    getUsedSize(): number;
    getItemUsedSpace<U extends keyof T>(key: U): boolean | typeof NaN;
}

export interface localStorageOptions {
    storage: 'localStorage' | 'sessionStorage';
}

export default class TypedStorage<T> implements localStorage<T> {
    private storage: Storage;
    constructor(options: localStorageOptions = { storage: 'localStorage' }) {
        this.storage = typeof window !== 'undefined' ? window[options.storage] : global[options.storage];
    }

    public length(): number {
        return this.storage.length;
    }

    public key<U extends keyof T>(index: number): U {
        return this.storage.key(index) as U;
    }

    public getItem<U extends keyof T>(key: U): T[U] | null {
        const item = this.storage.getItem(key.toString());
        if (item === null) {
            return item;
        }
        try {
            return JSON.parse(item) as T[U];
        } catch {
            return (item as unknown) as T[U];
        }
    }

    public setItem<U extends keyof T>(key: U, value: T[U]): void {
        this.storage.setItem(key.toString(), JSON.stringify(value));
    }

    public removeItem<U extends keyof T>(key: U): void {
        this.storage.removeItem(key.toString());
    }

    public clear(): void {
        this.storage.clear();
    }

    public hasItem<U extends keyof T>(key: U): boolean{
        return localStorage.getItem(key.toString()) !== null;
    }
    
    public getBackup(): object | null {
        let backup = {};
        for (let i = 0; i < localStorage.length; ++i) {
            let key = localStorage.key(i);
            let value = localStorage.getItem(key);
            backup[key] = value;
        }
        return backup;
    }

    public getRemainingSpace(): number {
        let itemBackup = localStorage.getItem("");
        let increase = true;
        let data = "1";
        let totalData = "";
        let trytotalData = "";
        while (true) {
            try {
                trytotalData = totalData + data;
                localStorage.setItem("", trytotalData);
                totalData = trytotalData;
                if (increase) {
                    data += data;
                }
            }
            catch (e) {
                if (data.length < 2) {
                    break;
                }
                increase = false;
                data = data.substr(data.length / 2);
            }
        }
        if (itemBackup === null) {
            localStorage.removeItem("");
        } else {
            localStorage.setItem("", itemBackup);
        }
        return totalData.length;
    }

    public applyBackup(backup: object, fClear: boolean, fOverwriteExisting: boolean): void {
        if (fClear === void 0) { fClear = true; }
        if (fOverwriteExisting === void 0) { fOverwriteExisting = true; }
        if (fClear == true) {
            localStorage.clear();
        }
        for (let key in backup) {
            if (fOverwriteExisting === false && backup[key] !== undefined) {
                continue;
            }
            let value = backup[key];
            localStorage.setItem(key, value);
        }
    }

    public getMaximumSize(): number {
        let backup = this.getBackup();
        this.storage.clear();
        let max = this.getRemainingSpace();
        this.applyBackup(backup, true, true);
        return max;
    }

    public getUsedSize(): number {
        let sum = 0;
        for (let i = 0; i < localStorage.length; ++i) {
            let key = localStorage.key(i)
            let value = localStorage.getItem(key);
            sum += key.length + value.length;
        }
        return sum;
    }

    public getItemUsedSpace<U extends keyof T>(key: U): boolean | typeof NaN {
        var value = localStorage.getItem(key.toString());
        if (value === null) {
            return NaN;
        } else {
            return key.toString().length + value.length;
        }
    }
}
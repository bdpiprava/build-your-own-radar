export class EnvProvider {
    defaultRingsBGColor(): string {
        return this.getOrDefault('DEFAULT_QUADRANTS_BG_COLOR', '#fff')
    }


    private getOrDefault<Value>(envName: string, defaultValue: Value): Value {
        const val = process.env[envName]
        if (val) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return val as Value;
        }

        return defaultValue
    }
}
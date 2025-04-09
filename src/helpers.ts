export const jsonHelper = {
    parseJson : (json:string, returnOnError: any = {}) => {
        try {
            return JSON.parse(json);
        } catch (error) {
            return returnOnError;
        }
    }
}

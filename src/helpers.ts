export const jsonHelper = {
    parseJson : (json:string, returnOnError = {}) => {
        try {
            return JSON.parse(json);
        } catch (error) {
            return returnOnError;
        }
    }
}

import { parse } from "search-params";

const params = parse(location.search);

export const IsDebug = (): boolean => {
    return "debug" in params && params["debug"] !== false;
};

class ParseContext {
    tokens = [];
    raw = "";
    idx = 0;

    constructor(inp) {
        this.raw = inp;
    }
}

const isAlpha = (c) => {
    return (
        (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9'));
}

const isWhitespace = (c) => {
    return (c === '\n' || c === ' ' || c === '\t');
}

const parseWhile = (charCond) => (ctx) => {
    const startIndex = ctx.idx;
    let endIndex = startIndex;
    while (charCond(ctx.raw[endIndex])) {
        endIndex++;
    }

    if (endIndex > startIndex) {
        return {
            type: "UNSPECIFIED",
            start: startIndex,
            end: endIndex
        };
    }
}

const parseAlphanumeric = () => parseWhile(isAlpha);

const parseWhitespace = () => parseWhile(isWhitespace);

const parseToken = (token) => (ctx) => {
    const startIndex = ctx.idx;
    if (ctx.raw.slice(startIndex, startIndex + token.length) === token) {
        return {
            start: startIndex,
            end: startIndex + token.length
        };
    }
}

const drop = (parser) => (ctx) => {
    const result = parser(ctx);
    if (!result) {
        return;
    }

    ctx.idx += (result.end - result.start);
}

const keep = (parser, type) => (ctx) => {
    const result = parser(ctx);
    if (!result) {
        return;
    }

    result.type = type;
    ctx.tokens.push(result);
    ctx.idx += (result.end - result.start);
}

const parseGo = () => (ctx) => {
    drop(parseWhitespace())(ctx);
    keep(parseToken("int"), "TOKEN_INT")(ctx);
    drop(parseWhitespace())(ctx);
    keep(parseToken("main"), "TOKEN_MAIN")(ctx);
    drop(parseWhitespace())(ctx);
}

let ctx = new ParseContext("0123asdf hello");
parseGo()(ctx);
console.log(ctx)

ctx = new ParseContext("     int main ");
parseGo()(ctx);
console.log(ctx)
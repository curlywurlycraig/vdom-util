class ParseContext {
    tokens = [];
    raw = "";
    idx = 0;

    constructor(inp) {
        this.raw = inp;
    }
}

const isAlpha = (c) => {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

const parseAlphanumeric = (ctx) => {
    const newToken = {
        raw: "",
    };

    while (isAlpha(ctx.raw[ctx.idx])) {
        newToken.raw += ctx.raw[ctx.idx];
        ctx.idx++;
    }

    ctx.tokens.push(newToken);
    return ctx;
}

console.log(parseAlphanumeric(new ParseContext("0123asdf hello")));
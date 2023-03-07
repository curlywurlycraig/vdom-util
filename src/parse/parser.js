export class ParseContext {
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

const parseWhileChar = (charCond) => (ctx) => {
    const startIndex = ctx.idx;
    let endIndex = startIndex;
    while (charCond(ctx.raw[endIndex]) && ctx.raw[endIndex] !== undefined) {
        endIndex++;
    }

    if (endIndex > startIndex) {
        return {
            start: startIndex,
            end: endIndex
        };
    }
}

const maybe = (parser) => (ctx) => {
    const result = parser(ctx);
    return result || {
        start: ctx.idx,
        end: ctx.idx
    };
}

const parseAlphanumeric = () => parseWhileChar(isAlpha);

const parseWhitespace = () => parseWhileChar(isWhitespace);

const parseCharacterCond = (cond) => (ctx) => {
    if (cond(ctx.raw[ctx.idx])) {
        return {
            start: ctx.idx,
            end: ctx.idx + 1
        }
    }
}

const parseCharacter = (ch) => parseCharacterCond(c => c === ch);

const parseString = (str) => {
    const parsers = [];
    for (let i = 0; i < str.length; i++) {
        parsers.push(parseCharacter(str[i]));
    }

    return and(...parsers);
}

// Returns null if any of the and fail, and resets.
// If the whole sequence of parsers succeeds to parse, returns a token span
const and = (...parsers) => (ctx) => {
    const startIdx = ctx.idx;
    let totalLength = 0;
    for (let i = 0; i < parsers.length; i++) {
        const parseResult = parsers[i](ctx);
        if (!parseResult) {
            // Reset the context index
            ctx.idx = startIdx;
            return null;
        }

        ctx.idx += (parseResult.end - parseResult.start);
        totalLength += (parseResult.end - parseResult.start);
    }

    ctx.idx = startIdx;
    return {
        start: ctx.idx,
        end: ctx.idx + totalLength
    }
}

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
    return result;
}

const consume = (parser, type) => (ctx) => {
    const result = parser(ctx);
    if (!result) {
        return;
    }

    result.type = type;
    result.parser = parser;
    ctx.tokens.push(result);
    ctx.idx += (result.end - result.start);
    return result;
}

const untilEnd = (parser) => (ctx) => {
    while (ctx.raw[ctx.idx] !== undefined) {
        parser(ctx);
    }
}

const or = (...parsers) => (ctx) => {
    for (let i = 0; i < parsers.length; i++) {
        const result = parsers[i](ctx);
        if (result) {
            return result;
        }
    }
}

// Returns the resulting token, but with length 0.
// Useful for including at the end of an "and" parser, when you don't
// want to include the final parsed result
const peek = (parser) => (ctx) => {
    const result = parser(ctx);
    if (!result) {
        return;
    }

    return {
        ...result,
        end: result.start
    };
}

const one = () => (ctx) => {
    return {
        start: ctx.idx,
        end: ctx.idx + 1
    };
}

const funcCallName = and(
    parseAlphanumeric(),
    peek(parseCharacter("("))
);

const comment = and(
    parseString("//"),
    maybe(parseWhileChar(c => c !== '\n'))
)

const string = and(
    parseCharacter('"'),
    maybe(parseWhileChar(c => c !== '"')),
    parseCharacter('"')
);

export const parseC = untilEnd(
    or(
        drop(parseWhitespace()),
        consume(funcCallName, "FUNC_CALL"),
        consume(comment, "COMMENT"),
        consume(string, "STRING"),
        consume(parseString("void"), "KEYWORD"),
        consume(parseString("return"), "KEYWORD"),
        consume(parseString("int"), "KEYWORD"),
        consume(parseString("double"), "KEYWORD"),
        consume(parseString("struct"), "KEYWORD"),
        consume(parseString("typedef"), "KEYWORD"),
        drop(one())
    )
)

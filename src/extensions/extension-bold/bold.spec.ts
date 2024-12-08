import { expect, test } from "vitest";
import { parse, serialize } from "../../../test-utils";


test('parse markdown with "*"', () => {
    expect(parse('**example**')).toMatchSnapshot();
});
test('parse markdown with "_"', () => {
    expect(parse('__example__')).toMatchSnapshot();
});
test('parse html', () => {
    expect(parse('<strong>example</strong>')).toMatchSnapshot();
});
test('serialize', () => {
    expect(serialize('<strong>example</strong>')).toEqual('**example**\n');
    expect(serialize('<strong data-markdown-marker="_">example</strong>')).toEqual('__example__\n');
});
test('expels whitespace / non letters', () => {
    expect(serialize('My <strong> example </strong>')).toEqual('My **example**\n');
});
test('encode boundary characters', () => {
    expect(serialize('Before<strong>! example.</strong>After')).toEqual('Befor&#x65;**! example.**&#x41;fter\n');
});

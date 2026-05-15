import { describe, it, expect } from 'vitest'
import { Trie } from './trie'

describe('Trie', () => {
  it('should insert words', () => {
    const trie = new Trie()
    trie.insert('hell')
    trie.insert('help')
    trie.insert('hello')
    trie.insert('jay')
    // uncomment to see the values being inserted into the trie
    // console.dir(trie, { depth: null })
  })
})

describe('Trie', () => {
  it('should return words', () => {
    const trie = new Trie()
    trie.insert('hell')
    trie.insert('help')
    trie.insert('hello')
    trie.insert('jay')
    trie.insert('java')

    // trie.suggestion('hel')
    // console.log(trie.suggestion('hel'))
    // console.log(trie.suggestion('ja'))
    // console.log(trie.suggestion('jazz'))
    // console.log(trie.suggestion(''))

    expect(trie.suggestion('hel')).toEqual(['hell', 'hello', 'help'])
    expect(trie.suggestion('jaz')).toEqual([])
    expect(trie.suggestion('')).toEqual(['hell', 'hello', 'help', 'java', 'jay'])
  })
})

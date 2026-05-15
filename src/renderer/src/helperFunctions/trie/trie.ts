class TrieNode {
  children: Map<string, TrieNode> = new Map()
  isEnd: boolean

  constructor() {
    this.isEnd = false
  }
}

class Trie {
  private root: TrieNode = new TrieNode()

  private insertHelper(s: string, currentNode: TrieNode) {
    if (s.length === 0) {
      currentNode.isEnd = true
      return
    }
    const currCharacter = s[0] // get the first character
    const remainingString = s.slice(1)
    if (currentNode.children.has(currCharacter)) {
      // if it already contains the current character, just remove the character and pass the rest of the string
      const child = currentNode.children.get(currCharacter)!
      this.insertHelper(remainingString, child)
    } else {
      // add a new trie node to the children of the current node
      currentNode.children.set(currCharacter, new TrieNode())
      const child = currentNode.children.get(currCharacter)!
      this.insertHelper(remainingString, child)
    }
  }

  public insert(s: string) {
    if (s.length === 0) {
      return
    }
    this.insertHelper(s, this.root)
  }

  public suggestion(s: string): string[] {
    let currNode = this.root
    for (let c of s) {
      if (currNode.children.has(c)) {
        currNode = currNode.children.get(c)!
      } else {
        return []
      }
    }
    // console.dir(currNode, { depth: null })
    return this.suggestionHelper(s, currNode).toSorted()
  }

  private suggestionHelper(s: string, currNode: TrieNode): string[] {
    const currentNode = currNode
    let ans: string[] = []
    if (currNode.isEnd) {
      ans.push(s)
    }
    for (let [characterKey, childNode] of currentNode.children) {
      let temp = s + characterKey
      let tempArray = this.suggestionHelper(temp, childNode)
      ans = [...ans, ...tempArray]
    }

    return ans
  }
}

export { Trie }

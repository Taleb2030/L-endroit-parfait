/** Wraps each word in a mask so it can rise into view. */
export default function SplitWords({ text = '' }) {
  return text.split(' ').map((word, i) => (
    <span className="split-mask" key={`${i}-${word}`}>
      <span className="split-word">{word}</span>
    </span>
  ))
}

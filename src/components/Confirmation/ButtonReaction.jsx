import "./ButtonReaction.css";

const particles = [
  { x: -20, y: -18, angle: -35, color: "#a5f3fc" },
  { x: 0, y: -25, angle: 5, color: "#facc15", dot: true },
  { x: 20, y: -17, angle: 35, color: "#f9a8d4" },
  { x: 25, y: 2, angle: 90, color: "#c4b5fd", dot: true },
  { x: 18, y: 21, angle: -30, color: "#a5f3fc" },
  { x: -3, y: 25, angle: 15, color: "#f9a8d4", dot: true },
  { x: -21, y: 17, angle: 40, color: "#facc15" },
  { x: -25, y: -1, angle: 90, color: "#c4b5fd", dot: true },
];

export default function ButtonReaction({ down = false }) {
  return (
    <span className={"button-reaction" + (down ? " button-reaction--down" : "")} aria-hidden="true">
      <span className="button-reaction__ring" />
      {particles.map((particle, index) => (
        <span
          key={index}
          className={"button-reaction__particle" + (particle.dot ? " button-reaction__particle--dot" : "")}
          style={{
            "--particle-x": particle.x + "px",
            "--particle-y": particle.y + "px",
            "--particle-angle": particle.angle + "deg",
            "--particle-color": particle.color,
          }}
        />
      ))}
      <span className="button-reaction__direction">
        <svg className="button-reaction__thumb" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="m8 10 4.1-6.5a1.8 1.8 0 0 1 3.2 1.4L14.5 9h4.1a2 2 0 0 1 2 2.4l-1.3 7a2 2 0 0 1-2 1.6H8Z" />
          <path d="M3 10h5v10H3z" />
        </svg>
      </span>
    </span>
  );
}

// Add zero in front of numbers < 10
export function zeroPad(i) {
  return (i < 10 ? `0${i}` : `${i}`);
}

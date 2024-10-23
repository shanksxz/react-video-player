export const formatTime = (seconds : number) => {
  const totalSeconds = Math.floor(seconds);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};

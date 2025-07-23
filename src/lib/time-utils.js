// Función helper para formatear hora a AM/PM
export function formatTimeToAMPM(time24) {
  if (!time24) return '';
  
  try {
    const [hours, minutes] = time24.split(':');
    const hour12 = parseInt(hours, 10);
    const ampm = hour12 >= 12 ? 'PM' : 'AM';
    const displayHour = hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    return time24; // Fallback al formato original
  }
}

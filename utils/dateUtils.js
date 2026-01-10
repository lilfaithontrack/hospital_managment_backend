/**
 * Date Utility Functions
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Format datetime to YYYY-MM-DD HH:mm:ss
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted datetime
 */
const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Format time to HH:mm:ss
 * @param {Date|string} date - Date/time to format
 * @returns {string} - Formatted time
 */
const formatTime = (date) => {
    const d = new Date(date);
    return d.toTimeString().split(' ')[0];
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} - Current date
 */
const getCurrentDate = () => {
    return formatDate(new Date());
};

/**
 * Get current datetime in YYYY-MM-DD HH:mm:ss format
 * @returns {string} - Current datetime
 */
const getCurrentDateTime = () => {
    return formatDateTime(new Date());
};

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} - Age in years
 */
const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
const isPast = (date) => {
    return new Date(date) < new Date();
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is today
 */
const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} - Start of day
 */
const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} - End of day
 */
const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * Calculate duration in minutes between two times
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {number} - Duration in minutes
 */
const calculateDurationMinutes = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
};

/**
 * Check if current time is within a time range
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {boolean} - True if current time is within range
 */
const isWithinTimeRange = (startTime, endTime) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

module.exports = {
    formatDate,
    formatDateTime,
    formatTime,
    getCurrentDate,
    getCurrentDateTime,
    addDays,
    calculateAge,
    isPast,
    isToday,
    startOfDay,
    endOfDay,
    calculateDurationMinutes,
    isWithinTimeRange
};

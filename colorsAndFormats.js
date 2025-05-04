// Column Format Functions
export const formatFunctions = {
    Dollar2: value => "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    Dollar0: value => {
        const formatted = "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        console.log(`Dollar0 formatted: input=${value}, output=${formatted}`);
        return formatted;
    },
    Dollar4: value => "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
    Perc0: value => (value * 100).toFixed(0) + "%",
    Perc2: value => (value * 100).toFixed(2) + "%",
    Perc4: value => (value * 100).toFixed(4) + "%",
    Text: value => value ? value.toString() : "", // Safely handle undefined or null values
    Dec0: value => value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    Dec2: value => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    Dec4: value => value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
    SpecialDate: value => {
        if (!value) return ""; // Return empty if no value

        if (value.includes("/")) {
            // Parse the date and convert it to MMM Dth (st/rd/th)
            const date = new Date(value);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });

            let suffix = 'th';
            if (day === 1 || day === 21 || day === 31) suffix = 'st';
            if (day === 2 || day === 22) suffix = 'nd';
            if (day === 3 || day === 23) suffix = 'rd';

            return `${month} ${day}${suffix}`;
        } else {
            // Return text if no "/" is found
            return value;
        }
    }
};

// Color Palette
export const colorPalette = {
    highlightYellow: "#FFFF00",  // Yellow for highlighting
    highlightGreen: "#90EE90",  // Light green for success
    highlightRed: "#FF6347",    // Red for errors
    highlightBlue: "#ADD8E6",   // Light blue for informational highlights
    highlightPurple: "#D8BFD8", // Light purple for soft highlights
    highlightOrange: "#FFA500", // Orange for attention-grabbing highlights
    Oxford: 'rgb(16,29,62)',
    Cadet: 'rgb(155,184,193)',
    Cinnabar: 'rgb(236, 74, 39)',
    Robin: 'rgb(52,192,206)',
    Persian: 'rgb(198,62,48)',
    Columbia: 'rgb(203,216,221)',
    Alabaster: 'rgb(229,230,217)',
    Tea: 'rgb(221,232,185)'
};

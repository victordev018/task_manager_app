
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    // Assuming dateString is "YYYY-MM-DD" or ISO
    const date = new Date(dateString + 'T00:00:00'); // Append time to avoid timezone issues with pure dates
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

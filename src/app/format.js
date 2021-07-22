export const formatDate = (dateStr) => {
    // BUG REPORT #4 - DASHBOARD - ajout de 'if'' pour faire fonctionner 'validé'
    if (dateStr) {
        const date = new Date(dateStr);
        // BUG REPORT #4 - DASHBOARD - ajout de 'isValid'' pour faire fonctionner 'en attente'
        Date.prototype.isValid = function() {
            return this.getTime() === this.getTime();
        };
        if (date.isValid()) {
            const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
            const mo = new Intl.DateTimeFormat('fr', { month: 'long' }).format(date)
            const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
            const month = mo.charAt(0).toUpperCase() + mo.slice(1)
            return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
        } else {
            console.log(date + ' : ' + dateStr);
        }
    } else {
        console.log(dateStr);
    }
}

export const formatStatus = (status) => {
    switch (status) {
        case "pending":
            return "En attente"
        case "accepted":
            return "Accepté"
        case "refused":
            return "Refused"
    }
}
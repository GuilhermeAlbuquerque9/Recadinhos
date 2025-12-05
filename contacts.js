export function loadContacts() {
    const saved = localStorage.getItem("contacts");
    return saved ? JSON.parse(saved) : [];
}

export function saveContacts(contacts) {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

export function addContact(name) {
    const contacts = loadContacts();
    const exists = contacts.some(c => c.name.toLowerCase() === name.toLowerCase());

    if (exists) {
        return { ok: false, message: "Este contato já existe!" };
    }

    const newContact = { id: Date.now(), name };
    contacts.push(newContact);
    saveContacts(contacts);

    return { ok: true, contact: newContact };
}

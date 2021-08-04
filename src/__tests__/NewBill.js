import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent, screen } from "@testing-library/dom";
import { ROUTES } from "../constants/routes";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import firestore from "../app/Firestore.js";

setLocalStorage('Employee');

function setLocalStorage(user) {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: user, email: 'johndoe@email.com' }));
}

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then the page instruction should be staded", () => {
            document.body.innerHTML = NewBillUI();
            expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
        });
        test("Then i can see nine fields", () => {
            document.body.innerHTML = NewBillUI();
            const form = document.querySelector("form");
            expect(form.length).toEqual(9);
        });
        test("Then i can upload a file", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            const testNewBill = new NewBill({ document, onNavigate, firestore, localStorage: window.localStorage });
            const submit = jest.fn(() => testNewBill.handleChangeFile);
            const newFile = screen.getByTestId("file");
            newFile.addEventListener("change", submit);
            const newImage = new File(["ficher.txt"], "fichier.txt", { type: "text/txt" });
            fireEvent.change(newFile, {
                target: {
                    files: [newImage],
                }
            });
            const submitedFile = screen.getByTestId("file").files.length;
            expect(submitedFile).toEqual(1);
        });
    });
    describe("When I submit a new bill", () => {
        test('Then he will be created', async() => {
            document.body.innerHTML = NewBillUI();
            Object.defineProperty(window, "location", {
                value: { hash: "#employee/bill/new" }
            });
            const newBill = new NewBill({ document, onNavigate, firestore: firestore, localStorage: setLocalStorage });
            const submit = screen.getByTestId('form-new-bill');
            const validBill = {
                name: "bill",
                date: "2021-23-03",
                type: "Transports",
                amount: 10,
                pct: 10,
                vat: "50",
                fileName: "test.jpeg",
                fileUrl: "http://test/test.jpeg"
            };
            newBill.createBill = (newBill) => newBill;
            document.querySelector('input[data-testid="expense-name"]').value = validBill.name;
            document.querySelector('input[data-testid="datepicker"]').value = validBill.date;
            document.querySelector('select[data-testid="expense-type"]').value = validBill.type;
            document.querySelector('input[data-testid="amount"]').value = validBill.amount;
            document.querySelector('input[data-testid="vat"]').value = validBill.vat;
            document.querySelector('input[data-testid="pct"]').value = validBill.pct;
            document.querySelector('textarea[data-testid="commentary"]').value = validBill.commentary;
            newBill.fileUrl = validBill.fileUrl;
            newBill.fileName = validBill.fileName;
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            submit.addEventListener('click', handleSubmit);
            fireEvent.click(submit);
            expect(handleSubmit).toHaveBeenCalled();
        });
    });
});
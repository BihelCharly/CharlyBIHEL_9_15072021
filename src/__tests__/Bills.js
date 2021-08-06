import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";
import { screen } from "@testing-library/dom";
import { bills } from "../fixtures/bills.js";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import firestore from "../app/Firestore.js";
import firebase from "../__mocks__/firebase";
import userEvent from '@testing-library/user-event';

setLocalStorage('Employee');

function setLocalStorage(user) {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: user, email: 'johndoe@email.com' }));
}

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
};

describe("When user is connected as an employee", () => {
    describe("When user is on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", () => {
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
        });
        test("Then bills should be ordered from earliest to latest", () => {
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
            const antiChrono = (a, b) => ((a < b) ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);

            expect(dates).toEqual(datesSorted);
        });
        test("Then button to add a new bill should works", () => {
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
            const testBills = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage });
            const handleClick = jest.fn(testBills.handleClickNewBill);
            const buttonNewBill = screen.getByTestId("btn-new-bill");
            buttonNewBill.addEventListener("click", handleClick);
            userEvent.click(buttonNewBill);
            expect(handleClick).toHaveBeenCalled();
        });
        test("Then all buttons to look at a bills should work", () => {
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;
            const testBills = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage });
            const iconEye = screen.getAllByTestId("icon-eye");
            $.fn.modal = jest.fn();
            const handleClick = jest.fn((icon) => testBills.handleClickIconEye(icon));
            iconEye.forEach(icon => {
                icon.addEventListener('click', (e) => handleClick(e.target));
                userEvent.click(icon);
            });
            expect(handleClick).toHaveBeenCalled();
        });
    });
    describe("When user clicks on new bill button", () => {
        test("Then new bill handler should be called", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const testBills = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage });
            testBills.handleClickNewBill = jest.fn();
            screen.getByTestId("btn-new-bill").addEventListener("click", testBills.handleClickNewBill);
            screen.getByTestId("btn-new-bill").click();
            expect(testBills.handleClickNewBill).toBeCalled();
        });
    });
    describe("When user clicks on the eye icon", () => {
            test("Then modal should pop", () => {
                document.body.innerHTML = BillsUI({ data: bills });
                const testBills = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage });
                testBills.handleClickIconEye = jest.fn();
                screen.getAllByTestId("icon-eye")[0].click();
                expect(testBills.handleClickIconEye).toBeCalled();
            })
            test("Then modal should display joined image", () => {
                document.body.innerHTML = BillsUI({ data: bills });
                const testBills = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage });
                const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
                $.fn.modal = jest.fn();
                testBills.handleClickIconEye(iconEye);
                expect($.fn.modal).toBeCalled();
                expect(document.querySelector(".modal")).toBeTruthy();
            })
        })
        // GET
    describe("Given I am connected as Employee", () => {
        describe("When I'm in Dashboard", () => {
            test("Then fetches bills with GET", async() => {
                const spyTest = jest.spyOn(firebase, "get")
                const bills = await firebase.get()
                expect(spyTest).toHaveBeenCalledTimes(1)
                expect(bills.data.length).toBe(4)
            })
            test("Then if it fails with 404 error", async() => {
                firebase.get.mockImplementationOnce(() =>
                    Promise.reject(new Error("Erreur 404"))
                )
                const html = BillsUI({ error: "Erreur 404" })
                document.body.innerHTML = html
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })
            test("Then if it fails with 500 error", async() => {
                firebase.get.mockImplementationOnce(() =>
                    Promise.reject(new Error("Erreur 500"))
                )
                const html = BillsUI({ error: "Erreur 500" })
                document.body.innerHTML = html
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})
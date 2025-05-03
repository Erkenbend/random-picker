import {JSX, useEffect, useState} from 'react'
import './App.css'


class Roll {
    time: number
    maxChoices: number
    result: number

    constructor(maxChoices: number, result: number) {
        this.time = performance.now() + performance.timeOrigin
        this.maxChoices = maxChoices
        this.result = result
    }
}

function App() {
    const [randomResult, updateRandomResult] = useState<Roll>(new Roll(0, 0))
    const buttonMinDefault = 2;
    const buttonMaxDefault = 8;
    const maxHistoryLength = 15;

    const [bounds, setBounds] = useState<number[]>([buttonMinDefault, buttonMaxDefault]);
    const [buttons, setButtons] = useState<JSX.Element[]>(generateButtons(buttonMinDefault, buttonMaxDefault));
    const [history, setHistory] = useState<Roll[]>([]);

    useEffect(() => {
        if (randomResult.result != 0) {
            setHistory(h => {
                const newH = [...h];
                if (h.length >= maxHistoryLength) {
                    newH.splice(0, 1)
                }
                newH.push(randomResult);
                return newH;
            })
        }
    }, [randomResult])

    function incrementRightSide() {
        const buttonLabel = bounds[1] + 1;
        const button = generateButton(buttonLabel);
        setButtons(b => [...b, button]);
        setBounds(b => [b[0], buttonLabel]);
    }

    function decrementRightSide() {
        setButtons(b => b.slice(0, -1));
        setBounds(b => [b[0], b[1] - 1]);
    }

    function incrementLeftSide() {
        const buttonLabel = bounds[0] - 1;
        const button = generateButton(buttonLabel);
        setButtons(b => [button, ...b]);
        setBounds(b => [buttonLabel, b[1]]);
    }

    function decrementLeftSide() {
        setButtons(b => b.slice(1, b.length))
        setBounds(b => [b[0] + 1, b[1]]);
    }

    function generateButtons(min: number, max: number): JSX.Element[] {
        const result = []
        for (let i = min; i <= max; i++) {
            result.push(generateButton(i))
        }
        return result
    }

    function generateButton(label: number): JSX.Element {
        return <button type="button" onClick={() => {
            updateRandomResult(() => new Roll(label, Math.ceil(Math.random() * label)));
        }} key={label}>{label}</button>
    }

    return (
        <>
            <div className="history">
                <h3 className="history-title">History</h3>
                {history.map(elem => <span className="history-element"
                                           key={elem.time}>{new Date(elem.time).toLocaleTimeString("en-DE")}&emsp;{elem.maxChoices} → {elem.result}</span>).reverse()}
            </div>
            <div className="instructions">
                <div className="size-changer">
                    <button type="button" onClick={incrementLeftSide} disabled={bounds[0] <= 2}>+</button>
                    <button type="button" onClick={decrementLeftSide} disabled={bounds[0] == bounds[1]}>-</button>
                </div>
                <div className="instructions-text">
                    Click on a button to randomly choose among that amount of options
                </div>
                <div className="size-changer">
                    <button type="button" onClick={decrementRightSide} disabled={bounds[0] == bounds[1]}>-</button>
                    <button type="button" onClick={incrementRightSide} disabled={bounds[1] >= 20}>+</button>
                </div>
            </div>
            <div className="button-list">
                {buttons}
            </div>
            <h1 className="result-card">
                <span className="result-text">Pick option </span><span
                className="random-result">{randomResult.result == 0 ? "-" : randomResult.result}</span>
            </h1>
            <div className="secret">Theo stinkt lul</div>
        </>
    )
}

export default App

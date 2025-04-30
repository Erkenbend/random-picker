import {useState} from 'react'
import './App.css'

// TODO: add history of previous choices
// TODO: make number of buttons configurable (+/- left and right)

function App() {
    const [randomResult, updateRandomResult] = useState<number>(0)
    const buttonMin = 2;
    const buttonMax = 8;

    function generateButtons(min: number, max: number) {
        const result = []
        for (let i = min; i <= max; i++) {
            result.push(<button type="button" onClick={() => {
                updateRandomResult(() => Math.ceil(Math.random() * i));
            }}>{i}</button>)
        }
        return result
    }

    return (
        <>
            <h2>
                Click on a button to randomly choose among that amount of options
            </h2>
            <div className="button-list">
                {generateButtons(buttonMin, buttonMax)}
            </div>
            <h1 className="result-card">
                <span className="result-text">Pick option </span><span
                className="random-result">{randomResult == 0 ? "-" : randomResult}</span>
            </h1>
            <div className="secret">Theo stinkt lul</div>
        </>
    )
}

export default App

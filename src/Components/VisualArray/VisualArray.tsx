import { Component }from 'react'
import './styles.css'
import { getRandomInt } from '../../Utility/Random/Random';
import Animator from '../../Utility/Animator/Animator';

interface _props{
    sort : (v : VisualArray) => Generator<void>,
    data : Array<number>,
    fps : number
};

enum State{
  normal,
  active
}

export class VisualArray extends Component<_props, {}> {
  numSwaps : number;
  numAccesses : number;
  numComparisons : number;
  states : Array<State>;
  data : Array<number>
  _generator : Generator<void> | null;
  _animator : Animator;
  constructor(props : _props){
      super(props);
      this.numSwaps = 0;
      this.numAccesses = 0;
      this.numComparisons = 0;
      this.data = [...this.props.data] /* Force a copy with spread operator */
      this.states = Array(this.props.data.length).fill(State.normal); /* Denotes which nodes are active */
      this._generator = props.sort(this);
      this._animator = new Animator(props.fps, (animatorRef : Animator) => {
        const next = this._generator!.next(); /* Get next fram */

        if(next.done){ /* If all frames have been taken then stop the animation */
            animatorRef.stop();
            console.log(this.getStatistics()); 
        }
        this.forceUpdate(() => this.#clearStates()); /* Rerender the component and after rerender(synchronous), clear the states array */
      });
  }    
  get(index : number){
      this.numAccesses++;
      this.states[index] = State.active;
      return this.data[index];
  }
  set(index : number, value : number){
      this.numAccesses++;
      this.states[index] = State.active;
      this.data[index] = value;
  }
  swap(i : number, j : number){
      this.numSwaps++;
      this.numAccesses += 4; /* Two reads, Two writes */
      [this.data[i], this.data[j]]=[this.data[j], this.data[i]];
  }
  gt(first : number, second : number){
      this.numComparisons++;
      return first > second;
  }
  lt(first : number, second : number){
      this.numComparisons++;
      return first < second;
  }
  eq(first : number, second : number){
      this.numComparisons++;
      return first === second;
  }
  gte(first : number, second : number){
      this.numComparisons++;
      return first >= second;
  }
  lte(first : number, second : number){
      this.numComparisons++;
      return first <= second;
  }
  length(){
    return this.data.length;
  }
  getStatistics(){
    return {numAccesses : this.numAccesses, numSwaps : this.numSwaps, numComparisons : this.numComparisons};
  }
  #clearStates(){
    this.states = Array(this.states.length).fill(State.normal);
  }
  render() {
    return (
      <>
        <div className='container'>
            {
            this.data.map((item, index) => 
                <div  
                  key = {index} 
                  className={this.states[index] === State.active ? 'container-item active-item' : 'container-item'}
                  style={{height : `${item}0px`}}>
                </div>
            )
            }
        </div>
        <button onClick = {() => {this._animator.start()}}>Click Please</button>
      </>
    )
  }
}
export default VisualArray;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Scroller, Orientation, Pagination } from 'react-scrolling';

const sizeProps = {
  container: 400,
};
const style = {
  width: '300px',
};
const searchStyle = {
  width: '300px',
  padding: '5px',
  backgroundColor: '#eee',
  borderRadius: '5px',
  color: '#888',
};

class Example extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      test: 0,
    };

    this.onChangeState = this.onChangeState.bind(this);
  }

  onChangeState() {
    this.setState({
      test: this.state.test + 1,
    });
  }

  render() {
    return (
      <div>
        <div onClick={this.onChangeState} >Change State</div>
        <Scroller
          id="scroller-p"
          orientation={ Orientation.Vertiacal }
          size={ Object.assign({}, sizeProps) }
          pagination={ Pagination.First } page={{ size: 40, margin: 0 }}
          onScroll={(pos) => { console.log(pos); }}
        >
          <div style={ searchStyle }>Search...</div>
          <p style={ style } >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Curabitur nec risus vel sapien mattis aliquam vel ullamcorper
            enim. Nulla fermentum euismod elit quis vulputate. Donec
            efficitur est justo, et sollicitudin dolor tincidunt non.
            Maecenas eget mattis nisi, nec vestibulum dui. Suspendisse
            potenti. Quisque malesuada tortor sit amet metus tempus, nec
            ullamcorper arcu dignissim. Phasellus dignissim leo vitae tellus
            molestie maximus. Integer eget orci nec ipsum faucibus rhoncus.
            Aliquam consectetur tempor pellentesque. Proin sit amet enim
            sem. Phasellus consequat consequat nisi sit amet vehicula. Duis
            placerat justo felis, vel tristique erat interdum eget. Maecenas
            scelerisque dolor mauris.
          </p>
          <p style={ style } >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Curabitur nec risus vel sapien mattis aliquam vel ullamcorper
            enim. Nulla fermentum euismod elit quis vulputate. Donec
            efficitur est justo, et sollicitudin dolor tincidunt non.
            Maecenas eget mattis nisi, nec vestibulum dui. Suspendisse
            potenti. Quisque malesuada tortor sit amet metus tempus, nec
            ullamcorper arcu dignissim. Phasellus dignissim leo vitae tellus
            molestie maximus. Integer eget orci nec ipsum faucibus rhoncus.
            Aliquam consectetur tempor pellentesque. Proin sit amet enim
            sem. Phasellus consequat consequat nisi sit amet vehicula. Duis
            placerat justo felis, vel tristique erat interdum eget. Maecenas
            scelerisque dolor mauris.
          </p>
        </Scroller>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '325px',
        }}
        >
          <Scroller
            id="scroller-2"
            orientation={ Orientation.Vertiacal }
            size={ Object.assign({}, sizeProps) }
            pagination={ Pagination.First } page={{ size: 40, margin: 0 }}
          >
            <div style={ searchStyle }>Search...</div>
            <p style={ style } >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Curabitur nec risus vel sapien mattis aliquam vel ullamcorper
              enim. Nulla fermentum euismod elit quis vulputate. Donec
              efficitur est justo, et sollicitudin dolor tincidunt non.
              Maecenas eget mattis nisi, nec vestibulum dui. Suspendisse
              potenti. Quisque malesuada tortor sit amet metus tempus, nec
              ullamcorper arcu dignissim. Phasellus dignissim leo vitae tellus
              molestie maximus. Integer eget orci nec ipsum faucibus rhoncus.
              Aliquam consectetur tempor pellentesque. Proin sit amet enim
              sem. Phasellus consequat consequat nisi sit amet vehicula. Duis
              placerat justo felis, vel tristique erat interdum eget. Maecenas
              scelerisque dolor mauris.
            </p>
          </Scroller>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Example />,
  document.getElementById('ReactScrolling')
);

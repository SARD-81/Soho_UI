import styled from 'styled-components';

const Switch = () => {
  return (
    <StyledWrapper>
      <div>
        <p className="component-title">iOS Switch + bigger size when active</p>
        <div className="switch-parent">
          <input type="checkbox" className="checkbox" id="checkbox" />
          <label className="switch" htmlFor="checkbox">
            <span className="slider" />
          </label>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Remove this container when use*/
  .component-title {
    width: 100%;
    position: absolute;
    z-index: 999;
    top: 30px;
    left: 0;
    padding: 0;
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #888;
    text-align: center;
  }

  /* The switch - the box around the slider */
  .switch-parent {
    width: 51px;
    height: 31px;
    position: relative;
  }

  /* Hide default HTML checkbox */
  .checkbox {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .switch {
    width: 100%;
    height: 100%;
    display: block;
    background-color: #e9e9eb;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease-out;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15), 0px 3px 1px rgba(0, 0, 0, 0.06);
  }

  /* The slider */
  .slider {
    width: 27px;
    height: 27px;
    position: absolute;
    left: calc(50% - 27px / 2 - 10px);
    top: calc(50% - 27px / 2);
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15), 0px 3px 1px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease-out;
    cursor: pointer;
  }

  .switch-parent:active .slider {
    width: 37px;
    border-radius: 20px;
  }

  .checkbox:checked + .switch:active .slider {
    width: 37px;
    left: calc(30% - 27px / 2 + 10px);
  }

  .checkbox:checked + .switch {
    background-color: #34c759;
  }

  .checkbox:checked + .switch .slider {
    left: calc(50% - 27px / 2 + 10px);
    top: calc(50% - 27px / 2);
  }`;

export default Switch;

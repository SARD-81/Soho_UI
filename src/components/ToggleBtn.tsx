import styled from 'styled-components';

interface ToggleBtnProps {
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (checked: boolean) => void;
}

const ToggleBtn = ({ checked = false, disabled = false, id, onChange }: ToggleBtnProps) => {
  return (
    <StyledWrapper>
      <div className="switch-parent">
        <input
          type="checkbox"
          className="checkbox"
          id={id ?? 'toggle-btn'}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <label className="switch" htmlFor={id ?? 'toggle-btn'}>
          <span className="slider" />
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .switch-parent {
    width: 54px;
    height: 32px;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

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
    background: linear-gradient(135deg, #e4e7ec 0%, #f4f6f8 100%);
    border-radius: 18px;
    cursor: pointer;
    transition: all 0.25s ease-out;
    box-shadow: 0px 6px 16px rgba(15, 73, 110, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .slider {
    width: 26px;
    height: 26px;
    position: absolute;
    left: 4px;
    top: 3px;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.15), 0px 3px 1px rgba(0, 0, 0, 0.06);
    transition: all 0.25s ease-out;
    cursor: pointer;
  }

  .switch-parent:active .slider {
    width: 32px;
  }

  .checkbox:checked + .switch {
    background: linear-gradient(135deg, #00c6a9 0%, #1fb6ff 100%);
    box-shadow: 0px 12px 24px rgba(0, 198, 169, 0.35);
    border-color: rgba(0, 198, 169, 0.35);
  }

  .checkbox:checked + .switch .slider {
    left: 24px;
  }

  .checkbox:disabled + .switch {
    cursor: not-allowed;
    background: #eceff3;
    border-color: #eceff3;
    box-shadow: none;
  }

  .checkbox:disabled + .switch .slider {
    background: #f6f7fb;
    box-shadow: none;
  }
`;

export default ToggleBtn;
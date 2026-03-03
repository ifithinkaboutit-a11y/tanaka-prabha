// src/data/interfaces/forms.d.ts

export interface PersonalDetailsFormProps {
  initialData: import("./profile").PersonalDetails;
  onSave: (data: import("./profile").PersonalDetails) => void;
  onCancel: () => void;
  /** Optional — opens the map picker for address auto-fill */
  onOpenMap?: () => void;
  /**
   * When set, only these address fields are applied to the current form state
   * without discarding any personal / family data the user has already typed.
   */
  addressOverride?: Record<string, string>;
}

export interface LandDetailsFormProps {
  initialData: import("./profile").LandDetails;
  onSave: (data: import("./profile").LandDetails) => void;
  onCancel: () => void;
}

export interface LivestockDetailsFormProps {
  initialData: import("./profile").LivestockDetails;
  onSave: (data: import("./profile").LivestockDetails) => void;
  onCancel: () => void;
}

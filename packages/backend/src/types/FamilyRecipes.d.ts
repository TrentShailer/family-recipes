declare namespace FamilyRecipes {
  export type Error = {
    message: string;
    code: string;
  };

  export type JWTPayload = {
    user: {
      id: string;
    };
  };
}

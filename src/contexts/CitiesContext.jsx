import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const CitiesContext = createContext();

const BASE_URL = "http://localhost:8000";

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };
    case "city/found":
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
      };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("there is somthing wrongin the use reducer");
  }
}

function CitiesProvider({ children }) {
  //const [cities, setCities] = useState([]);
  //const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});

  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "there is somthing wrong about fetching the data",
        });
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return;

      dispatch({ type: "loading" });

      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/found", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "there is somthing wrong about fetching the data",
        });
      }
    },
    [currentCity.id]
  );
  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({
        type: "city/created",
        payload: data,
      });
    } catch {
      dispatch({
        type: "rejected",
        payload: "there is somthing wrong about creating the city .",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({
        type: "city/deleted",
        payload: id,
      });
    } catch {
      dispatch({
        type: "rejected",
        payload: "there is somthing wrong about deleting the city",
      });
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        error,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

//to consume cities context every where in the Application by creating a custom Hook

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error(
      "CitiesContext was used out side of the Conntext Provider "
    );
  return context;
}
export { CitiesProvider, useCities };

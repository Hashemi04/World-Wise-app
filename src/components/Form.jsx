// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import { useCities } from "../contexts/CitiesContext";
import { useUrlPosition } from "../Hooks/useUrlPosition";

import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Button from "./Button";
import styles from "./Form.module.css";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const [lat, lng] = useUrlPosition();
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [GeocodingError, setGeocodingError] = useState("");

  useEffect(
    function () {
      if (!lat && !lng) return;

      async function fetchCityData() {
        try {
          setGeocodingError("");
          setIsLoadingGeocode(true);

          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();

          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));

          if (!data.countryCode)
            throw new Error(
              "That doesen't seem to be a city Click somewhere else 😊"
            );
        } catch (err) {
          setGeocodingError(err.message);
        } finally {
          setIsLoadingGeocode(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    await createCity(newCity);

    navigate("/app/cities");
  }
  if (isLoadingGeocode) return <Spinner />;

  if (!lat && !lng)
    return <Message message="start by clicking somewhere on the map" />;

  if (GeocodingError) return <Message message={GeocodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />*/}
        <DatePicker
          id="date"
          isClearable
          selected={date}
          onChange={(date) => setDate(date)}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
